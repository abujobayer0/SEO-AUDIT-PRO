const ShinyText = ({ text, disabled = false, speed = 5, className = "", color }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`text-[${color ? color : "#b5b5b5c2"}] bg-clip-text inline-block ${disabled ? "" : "animate-shine"} ${className}`}
      style={{
        backgroundImage: "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 60%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animationDuration: animationDuration,
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
