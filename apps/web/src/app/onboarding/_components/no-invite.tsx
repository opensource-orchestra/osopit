import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type NoInviteProps = {
  onGoHome: () => void;
};

export function NoInvite({ onGoHome }: NoInviteProps) {
  return (
    <Container>
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <Card className="w-full space-y-6 rounded-lg border border-border/60 bg-background/80 p-10 text-center shadow-sm backdrop-blur">
          <h1 className="font-black text-3xl text-foreground leading-tight sm:text-4xl">
            Invite Required
          </h1>
          <p className="text-muted-foreground">
            You need an invite code to create an artist profile.
          </p>
          <Button onClick={onGoHome} size="lg">
            Go to Home
          </Button>
        </Card>
      </div>
    </Container>
  );
}
