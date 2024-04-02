import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ILinkCardProps {
  level: number;
  expiration: string;
  encryptedPath: string;
  encryptMethod: string;
  decryptedPath: string;
}

function LinkCard({
  level,
  expiration,
  encryptedPath,
  encryptMethod,
  decryptedPath,
}: ILinkCardProps) {
  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle>{`Level ${level}`}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1.5">
        <p className="text-sm font-medium">Expires in</p>
        <p className="text-sm">{expiration}</p>
      </CardContent>
      <CardContent className="grid gap-1.5">
        <p className="text-sm font-medium">Encrypted Path</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate text-left">
              <p className="text-sm truncate">{encryptedPath}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{encryptedPath}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
      <CardContent className="grid gap-1.5">
        <p className="text-sm font-medium">Encrypt Method</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate text-left">
              <p className="text-sm truncate">{encryptMethod}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{encryptMethod}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
      <CardContent className="grid gap-1.5">
        <p className="text-sm font-medium">Decrypted Link</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="truncate text-left">
              <p className="text-sm truncate">{`https://ciphersprint.pulley.com/${decryptedPath}`}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p>{`https://ciphersprint.pulley.com/${decryptedPath}`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

export interface ILink {
  encrypted_path: string;
  encryption_method: string;
  expires_in: string;
  hint: string;
  instructions: string;
  level: number;
}

export default function Component() {
  const [links, setLinks] = useState<ILinkCardProps[]>([]);

  useEffect(() => {
    fetch("/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "heitorsaldanha@gmail.com" }),
    })
      .then((resp) => resp.json())
      .then((resp) => setLinks(resp));
  }, []);

  return (
    <div className="p-10 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {links.map((link) => (
        <LinkCard {...link} />
      ))}
    </div>
  );
}
