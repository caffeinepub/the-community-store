import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RentalRequestStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useGetBooks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRentalRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rentalRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRentalRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitRentalRequest() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      name,
      email,
      bookId,
    }: {
      name: string;
      email: string;
      bookId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRentalRequest(name, email, bookId);
    },
  });
}

export function useUpdateRequestStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      newStatus,
    }: {
      requestId: bigint;
      newStatus: RentalRequestStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRequestStatus(requestId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentalRequests"] });
    },
  });
}
