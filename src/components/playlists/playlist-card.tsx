import { useRouter } from 'next/navigation'
import { Playlist } from '@/types/music/playlist'
import { formatDate } from '@/lib/utils'

interface PlaylistCardProps {
  playlist: Playlist
  size?: 'small' | 'large'
}

export function PlaylistCard({ playlist, size = 'small' }: PlaylistCardProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(`/playlist/${playlist.id}`)}
      className="w-full h-full p-4 text-left flex flex-col"
    >
      {/* Songs count */}
      <p className="text-xs text-muted-foreground mb-2">
        {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
      </p>

      {/* Title */}
      <h3 className={`font-semibold truncate mb-1 ${size === 'large' ? 'text-lg' : 'text-base'}`}>
        {playlist.name}
      </h3>

      {/* Description */}
      {playlist.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {playlist.description}
        </p>
      )}

      {/* Push updated date to bottom */}
      <div className="mt-auto">
        <p className="text-xs text-muted-foreground">
          Updated {formatDate(playlist.updatedAt)}
        </p>
      </div>
    </button>
  )
} 