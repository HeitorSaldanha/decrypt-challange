import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { decryptLink } from "@/lib/utils";

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
        <p className="text-sm">{encryptedPath}</p>
      </CardContent>
      <CardContent className="grid gap-1.5">
        <p className="text-sm font-medium">Encrypt Method</p>
        <p className="text-sm">{encryptMethod}</p>
      </CardContent>
      <CardContent className="grid gap-1.5">
        <p className="text-sm font-medium">Decrypted Link</p>
        <a>{`https://ciphersprint.pulley.com/${decryptedPath}`}</a>
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
    const getChallange = (path = "heitorsaldanha@gmail.com") => {
      fetch(
        `https://cors-anywhere.herokuapp.com/https://ciphersprint.pulley.com/${path}`
      )
        .then((resp) => resp.json())
        .then(
          ({
            level,
            expires_in: expiration,
            encrypted_path: encryptedPath,
            encryption_method: encryptMethod,
          }: ILink) => {
            const decryptedPath = decryptLink({ encryptedPath, encryptMethod });
            console.log({
              level,
              expiration,
              encryptedPath,
              encryptMethod,
              decryptedPath,
            });
            setLinks((prev) => [
              ...prev,
              {
                level,
                expiration,
                encryptedPath,
                encryptMethod,
                decryptedPath,
              },
            ]);
            if (level < 3) getChallange(decryptedPath);
          }
        );
    };
    getChallange();
  }, []);

  return (
    <div className="p-10 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {links.map((link) => (
        <LinkCard {...link} />
      ))}
    </div>
  );
}
