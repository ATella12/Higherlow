import Link from "next/link";
import { GameContainer } from "@/components/GameContainer";
import { ConnectMenu } from "@/components/ConnectMenu";
import { MenuActions } from "./MenuActions";

export default function MenuPage() {
  return (
    <GameContainer>
      <div className="menu-row menu-row-start">
        <Link href="/" className="menu-link">
          Back
        </Link>
      </div>
      <div className="menu-card">
        <div className="menu-head">
          <span className="pill-label">Menu</span>
        </div>
        <ConnectMenu />
        <MenuActions />
      </div>
    </GameContainer>
  );
}
