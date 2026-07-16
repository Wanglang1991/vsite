import type { VideoItem } from '@/types';
import VideoCard from './VideoCard';

export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">暂无视频</p>
        <p className="text-sm mt-1">请先配置后端 API Key</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {videos.map(video => <VideoCard key={video.id} video={video} />)}
    </div>
  );
}
