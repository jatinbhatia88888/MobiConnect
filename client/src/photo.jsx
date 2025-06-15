export function Photo({ src, alt = "User", size = "2.5em", onClick }) {
  return (
    <div
      onClick={onClick} 
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
        cursor: "pointer", 
      }}
      className="photo"
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}

