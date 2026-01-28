import { CircleUserRound, Bookmark, LogOut, ChevronDown } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@headlessui/react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full px-6 py-4 bg-gray-900 fixed top-0 left-0 z-50">
      <nav className="flex items-center justify-between">
        <div className="w-1/3 text-sm text-gray-500"></div>

        <div className="w-1/3 text-center">
          <span className="text-2xl tracking-[0.35em] text-shadow-lg text-white">
            TRAVELGRAM
          </span>
        </div>

        <div className="w-1/3 text-right text-sm text-gray-500">
          {isAuthenticated ? (
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="group flex items-center space-x-2">
                <CircleUserRound className="w-9 h-9 text-gray-400 group-hover:text-white transition-colors" />
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
              </MenuButton>

              <MenuItems className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                </div>

                <div className="py-1">
                  <MenuItem>
                    <button
                      onClick={() => navigate("/saved")}
                      className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100"
                    >
                      <Bookmark className="mr-3 h-4 w-4" />
                      Saved Reels
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      onClick={async () => {
                        await logout();
                        navigate("/auth");
                      }}
                      className="group flex w-full items-center px-4 py-2 text-sm text-red-600 data-[focus]:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </Menu>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 font-semibold text-white shadow-inner shadow-white/8 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700 text-base"
            >
              Sign Up / Log In
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
