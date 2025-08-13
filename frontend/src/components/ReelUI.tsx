import {
  Heart,
  MessageCircle,
  Send,
  Home,
  Search,
  PlusSquare,
  Play,
  User,
  Bookmark,
} from "lucide-react";

function Reelui() {
  return (
    <div>
      <div className="absolute right-14 bottom-40 flex flex-col space-y-5 z-20">
        {/* Like */}
        <div className="flex flex-col items-center">
          <div className="size-5 flex items-center justify-center">
            <Heart className="text-white w-7 h-7" />
          </div>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <div className="size-5 flex items-center justify-center">
            <MessageCircle className="text-white w-7 h-7" />
          </div>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <div className="size-5 flex items-center justify-center">
            <Send className="text-white w-7 h-7" />
          </div>
        </div>

        {/* Save */}
        <div className="flex flex-col items-center">
          <div className="size-5 flex items-center justify-center">
            <Bookmark className="text-white w-7 h-7" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-20 left-3 right-0 p-4 pb-8 z-20">
        {/* Username + Caption */}
        <div className="mb-3">
          <div className="flex items-center space-x-3 mb-2">
            <div className="size-5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                <User className="text-gray-600 w-4 h-4" />
              </div>
            </div>
            <span className="text-white text-sm">user</span>
          </div>
          <p className="text-white text-xs leading-relaxed">
            Lorem ipsum dolor sit amet
            <span className="text-gray-300"> ...more</span>
          </p>
        </div>

        {/* Music */}
        <div className="flex items-center space-x-2 mb-10">
          <div className="flex items-center space-x-2 bg-black bg-opacity-20 rounded-full px-3 py-1">
            <div className="w-4 h-4 bg-white rounded-full animate-spin"></div>
            <span className="text-white text-xs">Original Audio - user</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute w-[81.5%] h-[23%] bottom-6 rounded-xl left-1.5 right-0 bg-black bg-opacity-80 backdrop-blur-sm z-30">
          <div className="flex justify-around items-center py-3 px-6">
            <Home className="text-white size-4" />
            <Search className="text-white size-4" />
            <PlusSquare className="text-white size-4" />
            <div className="relative">
              <Play className="text-white size-4 fill-white" />
            </div>
            <div className="size-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
      ;
    </div>
  );
}

export default Reelui;
