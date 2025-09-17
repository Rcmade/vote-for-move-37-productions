import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocketEvent } from "../../../hooks/useSocketEvent";
import { api } from "../../../lib/api";
import { useSocket } from "../../../providers/SocketProvider";

export type PollOption = { id: string; text: string; votes: number };
export type Poll = {
  id: string;
  question: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  options: PollOption[];
};

async function fetchPolls(): Promise<Poll[]> {
  const res = await api.get("/polls");
  const data = res.data;
  return data?.polls ?? data;
}

export function useLiveVotes() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const query = useQuery<Poll[], Error>({
    queryKey: ["polls"],
    queryFn: fetchPolls,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!query.data || !socket) return;
    const joinedPolls = new Set<string>();

    query.data.forEach((p) => {
      try {
        socket.emit("join_poll", { pollId: p.id }, () => {});
        joinedPolls.add(p.id);
      } catch (err) {
        console.warn("join poll failed", p.id, err);
      }
    });

    return () => {
      joinedPolls.forEach((pollId) =>
        socket.emit("leave_poll", { pollId }, () => {})
      );
    };
  }, [query.data, socket]);

  useSocketEvent("vote_update", (payload) => {
    const { pollId, options } = payload;
    queryClient.setQueryData<Poll[] | undefined>(["polls"], (old) => {
      if (!old) return old;
      return old.map((p) => {
        if (p.id !== pollId) return p;
        const newOptions = p.options.map((o) => {
          const updated = options.find((u) => u.id === o.id);
          return updated ? { ...o, votes: updated.votes } : o;
        });
        return { ...p, options: newOptions };
      });
    });
  });

  useSocketEvent("poll_created", (payload) => {
    const { poll } = payload;
    queryClient.setQueryData<Poll[] | undefined>(["polls"], (old) => {
      if (!old) return [poll];
      const exists = old.some((p) => p.id === poll.id);
      if (exists) return old;
      return [poll, ...old];
    });
  });

  return {
    polls: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
