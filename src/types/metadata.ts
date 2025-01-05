// Common metadata interface for shared flags across entities
export interface Metadata {
  isPublished: boolean;
  isFeatured: boolean;
  isPrivate: boolean;
  isDeleted: boolean;
  isDraft: boolean;
  isPending: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isHidden: boolean;
}

// Base interface for entities that have metadata
export interface MetadataEntity {
  metadata: Metadata;
  createdAt: string;
  updatedAt?: string | null;
} 