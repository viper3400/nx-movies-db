import {  Navbar,   NavbarBrand,   NavbarContent,   NavbarItem, NavbarMenuToggle} from "@nextui-org/navbar";
import { Link, Spacer } from "@nextui-org/react";
import { ThemeSwitch } from "./theme-switch";
import { SceneLogo } from "./icons";
import Github from "./github";
export default function NavbarComponent() {
  return (
    <div>
    <Navbar maxWidth="full">
      <NavbarBrand>
        <SceneLogo />
        <Spacer x={4}/>
        <p className="font-bold text-inherit">Filmdatenbank</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Neuer Film
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Suche
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Inventur
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex" justify="end">
        <NavbarItem>
          <Github />
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>


      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Github />
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>
    </Navbar>
    </div>
  );
}
