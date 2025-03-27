import { useTheme } from "@/lib/useTheme";

export default function Header() {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2 dark:text-blue-400">storage</span>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Disk Scheduling Simulator</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            id="darkModeToggle" 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleDarkMode}
          >
            <span className="material-icons dark:text-gray-200">
              {darkMode ? "light_mode" : "dark_mode"}
            </span>
          </button>
          <a 
            href="#" 
            className="text-primary hover:text-blue-600 flex items-center dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span className="material-icons text-sm mr-1">help_outline</span>
            <span className="text-sm">Help</span>
          </a>
        </div>
      </div>
    </header>
  );
}
