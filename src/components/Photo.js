import { useState } from "react";

function Photo({ src, fallback, alt }) {
  const [url, setUrl] = useState(src);

  return (
    <img
      src={url}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (fallback && url !== fallback) setUrl(fallback);
      }}
    />
  );
}

export default Photo;
