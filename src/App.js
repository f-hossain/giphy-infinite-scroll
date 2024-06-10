import "./styles.css";
import React from "react";

const Description = () => {
  return (
    <p>
      welcome to my giphy infinite scroll widget !! this allows you to scroll
      and find the trending gifs on giphy at the moment. scroll and discover
      away !!
    </p>
  );
};

const SkeletonImg = () => {
  return <div className="skeleton"></div>;
};

const API_KEY = `JGIJMJ81m9HEDPCrMNrEXROOuiBKx0Si`;
const getTrending = async ({ limit = 10, offset = 0 }) => {
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/trending?limit=${limit}&offset=${offset}&api_key=${API_KEY}`
  );
  const json = await res.json();
  return json;
};

const getSearch = async ({ search = "", limit = 10, offset = 0 }) => {
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(
      search
    )}&limit=${limit}&offset=${offset}&api_key=${API_KEY}`
  );
  const json = await res.json();
  return json;
};

/**
 * This is the main component. To use it with search, set type to search
 * @example
 *   <Giphy type="search" />
 */
const Giphy = ({ type = "trending", limit = 10 }) => {
  const [apiLoading, setApiLoading] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [atBottom, setAtBottom] = React.useState(false);
  const [gifs, setGifs] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef(null);
  const observer = React.useMemo(
    () =>
      new IntersectionObserver(([entry]) => {
        handleIntersection(entry);
      })
  );

  const handleIntersection = React.useCallback(
    (entry) => {
      setAtBottom((atBottom) => {
        if (!atBottom && entry.isIntersecting) {
          apiRequest(offset, search);
        }
        return entry.isIntersecting;
      });
    },
    [offset]
  );

  const apiRequest = React.useCallback(
    (offset, search) => {
      setApiLoading(true);
      switch (type) {
        case "trending": {
          getTrending({ limit, offset })
            .then((d) => {
              setOffset((offset) => {
                return offset + 10;
              });
              setTotal(d.pagination.total_count);
              setGifs((prevGifs) => [
                ...prevGifs,
                ...d.data.map((gif) => gif.images.fixed_height.url),
              ]);
            })
            .finally((_) => setApiLoading(false));
          break;
        }
        case "search": {
          getSearch({ limit, offset, search })
            .then((d) => {
              setOffset((offset) => {
                return offset + 10;
              });
              setTotal(d.pagination.total_count);
              setGifs((prevGifs) => [
                ...prevGifs,
                ...d.data.map((gif) => gif.images.fixed_height.url),
              ]);
            })
            .finally((_) => setApiLoading(false));
          break;
        }
        default:
          throw new Error("no");
      }
    },
    [setOffset, setTotal, setGifs]
  );

  React.useEffect(() => {
    if (!ref.current) return;
    // We can use an intersection observer to see if the
    // p element is in view. If it is, we are at the bottom
    // of the component, and we can trigger our loading functionality.
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [observer, ref]);

  React.useEffect(() => {
    apiRequest();
  }, []);

  const onSearch = (search) => {
    apiRequest(offset, search);
    setSearch(search);
  };

  return (
    <div className="giphy-component">
      {type === "search" ? (
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      ) : null}
      <div className="giphy-component__grid">
        {gifs.map((url) => (
          <div className="giphy-component__grid-item">
            <img key={url} src={url} />
          </div>
        ))}
      </div>
      {apiLoading ? <SkeletonImg /> : <p ref={ref}>loading...</p>}
    </div>
  );
};

export default function App() {
  return (
    <div className="App">
      <Description />
      <Giphy />
    </div>
  );
}
