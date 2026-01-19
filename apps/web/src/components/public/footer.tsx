import { Button } from "@/components/ui/button";

export const PublicFooter = () => {
  return (
    <footer className="text-muted-foreground w-full text-center text-sm py-4 border-t mt-auto">
      © {new Date().getFullYear()}{" "}
      <Button variant="link" className="p-0" asChild>
        <a href="https://pretosmusic.com/">PRETOS</a>
      </Button>
    </footer>
  );
};

