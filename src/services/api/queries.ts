import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from './apiClient';
import { Course, Module, Topic, UserProgress } from '../../types';

// Query Keys
export const queryKeys = {
  courses: ['courses'] as const,
  course: (id: string) => ['courses', id] as const,
  progress: ['user_progress'] as const,
  adminSession: ['admin_session'] as const,
};

// ================= Courses Queries & Mutations =================

export function useCoursesQuery() {
  return useQuery({
    queryKey: queryKeys.courses,
    queryFn: () => courseApi.getCourses(),
  });
}

export function useCourseQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.course(courseId),
    queryFn: () => courseApi.getCourseById(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCreateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseData: Partial<Course>) => courseApi.createCourse(courseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

export function useUpdateCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Partial<Course> }) =>
      courseApi.updateCourse(courseId, data),
    onSuccess: (updatedCourse) => {
      queryClient.setQueryData(queryKeys.course(updatedCourse.id), updatedCourse);
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

export function useDeleteCourseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => courseApi.deleteCourse(courseId),
    onSuccess: (_data, courseId) => {
      queryClient.removeQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

// ================= Topic & Module Mutations =================

export function useCreateModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleData }: { courseId: string; moduleData: Partial<Module> }) =>
      courseApi.createModule(courseId, moduleData),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

export function useDeleteModuleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId }: { courseId: string; moduleId: string }) =>
      courseApi.deleteModule(courseId, moduleId),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

export function useCreateTopicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      topicData,
    }: {
      courseId: string;
      moduleId: string;
      topicData: Partial<Topic>;
    }) => courseApi.createTopic(courseId, moduleId, topicData),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

export function useUpdateTopicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      topicId,
      topicData,
    }: {
      courseId: string;
      moduleId: string;
      topicId: string;
      topicData: Partial<Topic>;
    }) => courseApi.updateTopic(courseId, moduleId, topicId, topicData),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

export function useDeleteTopicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      topicId,
    }: {
      courseId: string;
      moduleId: string;
      topicId: string;
    }) => courseApi.deleteTopic(courseId, moduleId, topicId),
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.courses });
    },
  });
}

// ================= User Progress Queries & Optimistic Mutations =================

export function useUserProgressQuery() {
  return useQuery({
    queryKey: queryKeys.progress,
    queryFn: () => courseApi.getUserProgress(),
  });
}

export function useToggleTopicMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topicId: string) => courseApi.toggleTopicCompleted(topicId),
    onMutate: async (topicId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.progress });
      const prevProgress = queryClient.getQueryData<UserProgress>(queryKeys.progress);

      if (prevProgress) {
        const isCurrentlyCompleted = prevProgress.completedTopicIds.includes(topicId);
        const updatedCompleted = isCurrentlyCompleted
          ? prevProgress.completedTopicIds.filter((id: string) => id !== topicId)
          : [...prevProgress.completedTopicIds, topicId];

        queryClient.setQueryData<UserProgress>(queryKeys.progress, {
          ...prevProgress,
          completedTopicIds: updatedCompleted,
          lastActiveTopicId: topicId,
        });
      }

      return { prevProgress };
    },
    onError: (_err, _topicId, context) => {
      if (context?.prevProgress) {
        queryClient.setQueryData(queryKeys.progress, context.prevProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

export function useToggleBookmarkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (topicId: string) => courseApi.toggleBookmark(topicId),
    onMutate: async (topicId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.progress });
      const prevProgress = queryClient.getQueryData<UserProgress>(queryKeys.progress);

      if (prevProgress) {
        const isCurrentlyBookmarked = prevProgress.bookmarkedTopicIds.includes(topicId);
        const updatedBookmarks = isCurrentlyBookmarked
          ? prevProgress.bookmarkedTopicIds.filter((id: string) => id !== topicId)
          : [...prevProgress.bookmarkedTopicIds, topicId];

        queryClient.setQueryData<UserProgress>(queryKeys.progress, {
          ...prevProgress,
          bookmarkedTopicIds: updatedBookmarks,
        });
      }

      return { prevProgress };
    },
    onError: (_err, _topicId, context) => {
      if (context?.prevProgress) {
        queryClient.setQueryData(queryKeys.progress, context.prevProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

export function useSaveNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, noteText }: { topicId: string; noteText: string }) =>
      courseApi.saveNote(topicId, noteText),
    onMutate: async ({ topicId, noteText }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.progress });
      const prevProgress = queryClient.getQueryData<UserProgress>(queryKeys.progress);

      if (prevProgress) {
        const nextNotes = { ...prevProgress.topicNotes };
        if (!noteText.trim()) {
          delete nextNotes[topicId];
        } else {
          nextNotes[topicId] = noteText;
        }

        queryClient.setQueryData<UserProgress>(queryKeys.progress, {
          ...prevProgress,
          topicNotes: nextNotes,
        });
      }

      return { prevProgress };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevProgress) {
        queryClient.setQueryData(queryKeys.progress, context.prevProgress);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progress });
    },
  });
}

export function useSaveQuizMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, score, total }: { topicId: string; score: number; total: number }) =>
      courseApi.saveQuizResult(topicId, score, total),
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(queryKeys.progress, updatedProgress);
    },
  });
}
