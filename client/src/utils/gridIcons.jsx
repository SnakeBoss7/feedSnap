import { Grid2x2 } from "lucide-react";
const boxPositions = {
  "top-left": "top-[5px] left-[5px]",
  "top-right": "top-[5px] right-[5px]",
  "bottom-left": "bottom-[5px] left-[5px]",
  "bottom-right": "bottom-[5px] right-[5px]",
};

export const HighlightedGridIcon = ({ highlight = "top-left" }) => {
  const position = boxPositions[highlight];

  return (
    <div className="relative w-8 h-8 ">
      <Grid2x2 className="w-full h-full text-zinc-800" />
      <div
        className={`absolute ${position} w-[31%] h-[31%] bg-blue-400 rounded-xl opacity-100 rounded-sm`}
      />
    </div>
  );
};