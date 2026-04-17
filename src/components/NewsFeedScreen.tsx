import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "../stores/useStore";

export function NewsFeedScreen() {
  const { stories, feedItems, toggleLike, markStoryRead } = useStore();
  const [heartId, setHeartId] = useState<string | null>(null);

  const handleDoubleTap = (id: string) => {
    const item = feedItems.find((f) => f.id === id);
    if (item && !item.liked) toggleLike(id);
    setHeartId(id);
    setTimeout(() => setHeartId(null), 800);
  };

  return (
    <div className="pb-24 pt-2 space-y-4">
      <div className="px-4">
        <h1 className="text-xl font-bold font-heading">Feed</h1>
      </div>

      {/* Stories */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => markStoryRead(story.id)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div
              className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl ${
                story.read
                  ? "border-2 border-muted"
                  : "border-[3px] border-primary bg-gradient-to-br from-primary/20 to-accent/20"
              }`}
            >
              {story.image}
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{story.title}</span>
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3 px-4">
        {feedItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-card border border-border overflow-hidden"
          >
            {/* Author */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
              <span className="text-xl">{item.authorAvatar}</span>
              <div>
                <p className="text-xs font-semibold">{item.author}</p>
                <p className="text-[10px] text-muted-foreground">{item.date}</p>
              </div>
              <span className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {item.category}
              </span>
            </div>

            {/* Content */}
            <div
              className="relative px-3 pb-2"
              onDoubleClick={() => handleDoubleTap(item.id)}
            >
              {item.type === "reel" && (
                <div className="relative rounded-xl bg-foreground/10 h-48 flex items-center justify-center mb-2">
                  <span className="text-5xl opacity-50">▶️</span>
                  <span className="absolute bottom-2 right-2 text-[10px] bg-foreground/50 text-card px-2 py-0.5 rounded-full">
                    0:60
                  </span>
                </div>
              )}
              {item.type === "offer" && (
                <div className="rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 p-4 mb-2 border border-primary/20">
                  <span className="text-3xl">{item.image}</span>
                </div>
              )}
              <h3 className="text-sm font-bold font-heading">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>

              {/* Heart animation */}
              {heartId === item.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl pointer-events-none"
                >
                  ❤️
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 px-3 pb-3">
              <button
                onClick={() => toggleLike(item.id)}
                className="flex items-center gap-1"
              >
                <motion.span
                  animate={{ scale: item.liked ? [1, 1.3, 1] : 1 }}
                  className="text-base"
                >
                  {item.liked ? "❤️" : "🤍"}
                </motion.span>
                <span className="text-xs text-muted-foreground">{item.likes}</span>
              </button>
              <button className="flex items-center gap-1">
                <span className="text-base">💬</span>
                <span className="text-xs text-muted-foreground">Reply</span>
              </button>
              <button className="ml-auto">
                <span className="text-base">📤</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
