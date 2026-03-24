import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notice } from "../backend.d";
import { UserRole } from "../backend.d";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNotices() {
  const { actor, isFetching } = useActor();
  return useQuery<Notice[]>({
    queryKey: ["notices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNotices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notice: Notice) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createNotice(notice);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
}

export function useDeleteNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteNotice(title);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
}

export function useUpdateNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      newBody,
    }: { title: string; newBody: string }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateNotice(title, newBody);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      role,
    }: { principal: Principal; role: UserRole }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.assignCallerUserRole(principal, role);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["callerRole", "isAdmin"] }),
  });
}
