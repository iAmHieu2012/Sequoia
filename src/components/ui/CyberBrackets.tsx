export default function CyberBrackets({ color = "border-system/50" }: { color?: string }) {
  return (
    <>
      <div className={`absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 ${color}`} />
      <div className={`absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 ${color}`} />
      <div className={`absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 ${color}`} />
      <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 ${color}`} />
    </>
  );
}
