import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={`relative overflow-hidden ${className}`}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      className="flex touch-none select-none transition-colors duration-[160ms] ease-out hover:bg-gray-200 hover:bg-opacity-50 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
      orientation="vertical"
    >
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar
      className="flex touch-none select-none transition-colors duration-[160ms] ease-out hover:bg-gray-200 hover:bg-opacity-50 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
      orientation="horizontal"
    >
      <ScrollAreaPrimitive.Thumb className="flex-1 bg-gray-300 rounded-full relative" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

export { ScrollArea }