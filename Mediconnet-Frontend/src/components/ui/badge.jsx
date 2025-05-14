import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const statusMap = {
  Approved: { label: 'Approved', color: 'green' },
  Pending: { label: 'In progress', color: 'yellow' },
  Suspended: { label: 'Suspended', color: 'red' }
};

const badgeVariants = cva(
  "inline-flex items-center rounded-md  px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        Confirmed:
          "bg-successLight  text-success ",
          Pending:
          "bg-warningLight  text-warning  ",
          Cancelled:
          " bg-errorLight  text-error ",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
