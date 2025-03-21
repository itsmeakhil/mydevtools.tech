import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationDemoProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageChange: (page: number) => void;
}

export default function PaginationDemo({
  currentPage,
  totalPages,
  onNextPage,
  onPreviousPage,
  onPageChange,
}: PaginationDemoProps) {
  const renderPageNumbers = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always show the first page
        i === totalPages || // Always show the last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Show pages near the current page
      ) {
        pages.push(
          <PaginationItem key={i}>
            <PaginationLink
              className="cursor-pointer bg-white text-black 
                         hover:bg-gray-200 rounded-md px-3 py-1
                         dark:bg-black dark:text-white dark:hover:bg-gray-800"
              isActive={i === currentPage}
              onClick={() => onPageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        (i === currentPage - 2 && i > 1) || // Add ellipsis before the current page range
        (i === currentPage + 2 && i < totalPages) // Add ellipsis after the current page range
      ) {
        pages.push(
          <PaginationEllipsis key={`ellipsis-${i}`} className="cursor-pointer" />
        );
      }
    }

    return pages;
  };

  return (
    <Pagination className="bg-white dark:bg-black rounded-md p-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className="cursor-pointer bg-white text-black 
                       hover:bg-gray-200 rounded-md px-3 py-1
                       dark:bg-black dark:text-white dark:hover:bg-gray-800"
            onClick={onPreviousPage}
          />
        </PaginationItem>
        {renderPageNumbers()}
        <PaginationItem>
          <PaginationNext
            className="cursor-pointer bg-white text-black 
                       hover:bg-gray-200 rounded-md px-3 py-1
                       dark:bg-black dark:text-white dark:hover:bg-gray-800"
            onClick={onNextPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
