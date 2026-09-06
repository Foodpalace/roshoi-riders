import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11 px-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
        outline: "border border-border bg-surface text-fg hover:bg-muted",
        ghost: "text-fg hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
        online: "bg-online text-primary-foreground hover:opacity-90 active:scale-[0.98]",
      },
      size: {
        default: "h-11",
        lg: "h-14 rounded-lg px-5 text-base",
        sm: "h-10 text-sm",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";
