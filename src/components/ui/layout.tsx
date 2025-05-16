import React from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "./nav-menu";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (<>
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
          <NavigationMenuLink href="/lobby" className={navigationMenuTriggerStyle()}>Lobby</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
    <main className="bg-slate-900 flex items-center justify-center flex-col h-screen">{children}</main>
  </>)
};

export default Layout;