export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12 dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="md:flex md:justify-between md:items-center">
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Disk Scheduling Simulator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
