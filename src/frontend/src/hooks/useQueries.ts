import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RentalRequestStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useGetBooks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.getBooks();
    },
    enabled: !!actor && !isFetching,
    retry: 3,
    staleTime: 0,
  });
}

export function useIsAdminPasswordSet() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdminPasswordSet"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdminPasswordSet();
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getRentalRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRentalRequestsWithPassword(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rentalRequestsWithPassword", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.getRentalRequestsWithPassword(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
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

export function useCheckAdminPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.checkAdminPassword(password);
    },
  });
}

export function useSetAdminPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      newPassword,
      currentPassword,
    }: {
      newPassword: string;
      currentPassword: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setAdminPassword(newPassword, currentPassword);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isAdminPasswordSet"] });
    },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateRequestStatus(requestId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentalRequests"] });
    },
  });
}

export function useUpdateRequestStatusWithPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      requestId,
      newStatus,
    }: {
      password: string;
      requestId: bigint;
      newStatus: RentalRequestStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRequestStatusWithPassword(
        password,
        requestId,
        newStatus,
      );
    },
    onSuccess: (
      _data: unknown,
      variables: {
        password: string;
        requestId: bigint;
        newStatus: RentalRequestStatus;
      },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["rentalRequestsWithPassword", variables.password],
      });
    },
  });
}

export function useAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      title,
      author,
      description,
    }: {
      password: string;
      title: string;
      author: string;
      description: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addBook(password, title, author, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      id,
      title,
      author,
      description,
      available,
    }: {
      password: string;
      id: bigint;
      title: string;
      author: string;
      description: string;
      available: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBook(
        password,
        id,
        title,
        author,
        description,
        available,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useRemoveBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      id,
    }: {
      password: string;
      id: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeBook(password, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}
