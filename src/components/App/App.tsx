import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMovies } from "../../services/movieService";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import toast, { Toaster } from "react-hot-toast";
import type { Movie } from "../../types/movie";
import ReactPaginate from "react-paginate";
import css from "./App.module.css";

const notifyNoMovies = () => toast.error("No movies found for your request.");

export default function App() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movies", searchText, page],
    queryFn: () => getMovies({ query: searchText, page }),
    enabled: searchText.trim().length > 0,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data && data.results.length === 0) {
      notifyNoMovies();
    }
  }, [data]);

  const totalPages = data?.total_pages ?? 0;

  const handleSearch = (text: string) => {
    setPage(1);
    setSearchText(text);
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {totalPages > 1 && (
        <ReactPaginate
          containerClassName={css.pagination}
          activeClassName={css.active}
          breakLabel="..."
          nextLabel=">"
          previousLabel="<"
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          pageRangeDisplayed={5}
          marginPagesDisplayed={3}
          pageCount={totalPages}
          renderOnZeroPageCount={null}
        />
      )}

      <MovieGrid movies={data?.results ?? []} onSelect={setSelectedMovie} />

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      <Toaster />
    </div>
  );
}
