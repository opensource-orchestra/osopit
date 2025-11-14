import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ADDRESS_PREFIX_LENGTH, ADDRESS_SUFFIX_LENGTH } from "@/lib/constants";

type AlreadyHasProfileProps = {
  ensName?: string;
  address?: string;
  onGoHome: () => void;
};

export function AlreadyHasProfile({
  ensName,
  address,
  onGoHome,
}: AlreadyHasProfileProps) {
  return (
    <Container sm>
      <Card className="w-full space-y-6 rounded-lg border border-border/60 bg-background/80 p-10 text-center shadow-sm backdrop-blur">
        <h1 className="font-black text-2xl text-foreground leading-tight">
          Profile Already Exists
        </h1>
        <div className="space-y-4">
          <div className="rounded-lg border border-primary px-4 py-5 text-left shadow-sm">
            <p className="mb-2 font-semibold text-foreground text-sm">
              You already own a subdomain
            </p>
            {ensName ? (
              <p className="font-mono text-foreground text-xs">{ensName}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                (Subdomain detected on-chain)
              </p>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Each wallet can only register one subdomain. You can view or edit
            your existing profile.
          </p>
          <p className="text-muted-foreground text-xs">
            Connected: {address?.slice(0, ADDRESS_PREFIX_LENGTH)}...
            {address?.slice(-ADDRESS_SUFFIX_LENGTH)}
          </p>
        </div>
        <Button className="w-full" onClick={onGoHome} size="lg">
          Go to Home
        </Button>
      </Card>
    </Container>
  );
}
