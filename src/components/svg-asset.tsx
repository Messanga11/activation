import React from "react";
import { cn } from "../lib/utils";

export const SvgAsset = React.forwardRef<
  HTMLDivElement,
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > & {
    icon: string;
    size?: number;
    height?: number;
    width?: number;
  }
>(({ icon, height: _h, width: _w, size, className, style, ...other }, ref) => {
  const url = icon;
  const height = _h ?? size;
  const width = _w ?? size;

  return (
    <span
      className={cn("svg-color", !width && "w-6", !height && "h-6", className)}
      ref={ref}
      style={{
        width,
        height,
        display: "inline-block",
        backgroundColor: "currentColor",
        mask: `url(${url}) no-repeat center / contain`,
        WebkitMask: `url(${url}) no-repeat center / contain`,
        ...style,
      }}
      {...other}
    />
  );
});

SvgAsset.displayName = "SvgAsset";
