import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Media {
  id: number;
  title: string;
  type: string;
  url: string;
}

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
  status: string;
}

interface MachineMedia {
  id: string;
  vending_machine_id: string;
  media_id: number;
}

export default function Signage() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Media[]>([]);
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [assignments, setAssignments] = useState<Record<number, string[]>>({}); // mediaId -> machineIds
  const [loading, setLoading] = useState(false);

  // Fetch media and machines
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch all media
      const { data: mediaData, error: mediaError } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (mediaError) toast({ title: "Error fetching media", description: mediaError.message });
      else setVideos(mediaData || []);

      // Fetch all machines
      const { data: machineData, error: machineError } = await supabase
        .from("vending_machines")
        .select("*");

      if (machineError) toast({ title: "Error fetching machines", description: machineError.message });
      else setMachines(machineData || []);

      // Fetch existing assignments
      const { data: machineMediaData, error: assignmentError } = await supabase
        .from("machine_media")
        .select("*");

      if (!assignmentError && machineMediaData) {
        const map: Record<number, string[]> = {};
        machineMediaData.forEach((mm: MachineMedia) => {
          if (!map[mm.media_id]) map[mm.media_id] = [];
          map[mm.media_id].push(mm.vending_machine_id);
        });
        setAssignments(map);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Assign / Deassign media to a machine
  const toggleAssignment = async (mediaId: number, machineId: string) => {
    const assignedMachines = assignments[mediaId] || [];
    const isAssigned = assignedMachines.includes(machineId);

    if (isAssigned) {
      // Deassign
      const { error } = await supabase
        .from("machine_media")
        .delete()
        .match({ media_id: mediaId, vending_machine_id: machineId });

      if (error) return toast({ title: "Failed to deassign", description: error.message });

      setAssignments((prev) => ({
        ...prev,
        [mediaId]: prev[mediaId].filter((id) => id !== machineId),
      }));
    } else {
      // Assign
      const { error } = await supabase.from("machine_media").insert({
        media_id: mediaId,
        vending_machine_id: machineId,
      });

      if (error) return toast({ title: "Failed to assign", description: error.message });

      setAssignments((prev) => ({
        ...prev,
        [mediaId]: [...(prev[mediaId] || []), machineId],
      }));
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Assign Media to Machines</h1>

      {loading && <p>Loading...</p>}

      {videos.map((video) => (
        <div key={video.id} className="border rounded p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {video.type === "video" ? (
              <video
                src={video.url}
                controls
                className="w-full md:w-96 h-48 rounded"
              />
            ) : (
              <img src={video.url} alt={video.title} className="w-full md:w-96 h-48 object-cover rounded" />
            )}

            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">{video.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {machines.map((m) => (
                  <Button
                    key={m.id}
                    size="sm"
                    variant={assignments[video.id]?.includes(m.id) ? "destructive" : "default"}
                    onClick={() => toggleAssignment(video.id, m.id)}
                  >
                    {m.machine_id} {assignments[video.id]?.includes(m.id) ? "(Assigned)" : ""}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
