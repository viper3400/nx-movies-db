import {  Navbar,   NavbarBrand,   NavbarContent,   NavbarItem} from "@nextui-org/navbar";
import { Link, Spacer } from "@nextui-org/react";
import Github from "./github";

export const MovieLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const SceneLogo = () => {
  return (
    <svg fill="#ffffff" height="36" width="36" version="1.1" id="Icons"
    viewBox="0 0 32 32">
      <g id="SVGRepo_bgCarrier"></g>
      <g id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path d="M31.6,5.2C31.4,5,31,5,30.7,5C21.1,7.6,10.9,7.6,1.3,5C1,5,0.6,5,0.4,5.2C0.1,5.4,0,5.7,0,6v20c0,0.3,0.1,0.6,0.4,0.8 S1,27,1.3,27c9.6-2.6,19.8-2.6,29.5,0c0.1,0,0.2,0,0.3,0c0.2,0,0.4-0.1,0.6-0.2c0.2-0.2,0.4-0.5,0.4-0.8V6C32,5.7,31.9,5.4,31.6,5.2 z M20.1,17.7l-5,3c-0.3,0.2-0.7,0.3-1,0.3c-0.3,0-0.7-0.1-1-0.3c-0.6-0.4-1-1-1-1.7V13c0-0.7,0.4-1.3,1-1.7c0.6-0.4,1.4-0.3,2,0l5,3 c0.6,0.4,0.9,1,0.9,1.7S20.6,17.3,20.1,17.7z"></path> </g></svg>
  );
};
export const PopcornLogo = () => {
  return (
    <svg
    fill="#ffffff"
    height="36"
    width="36" version="1.1" id="Icons"  viewBox="0 0 32 32"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M26,16H6c-1.7,0-3-1.3-3-3s1.3-3,3-3h20c1.7,0,3,1.3,3,3S27.7,16,26,16z"></path> </g> <path d="M26.7,14.3C26.6,14.1,26.3,14,26,14H6c-0.3,0-0.6,0.1-0.7,0.3C5.1,14.6,5,14.8,5,15.1l2,16C7.1,31.6,7.5,32,8,32h5 c-0.5,0-1-0.4-1-0.9l-1-14c0-0.6,0.4-1,0.9-1.1c0.6,0,1,0.4,1.1,0.9l1,14c0,0.6-0.4,1-0.9,1.1c0,0,0,0-0.1,0h6c0,0,0,0-0.1,0 c-0.6,0-1-0.5-0.9-1.1l1-14c0-0.6,0.5-1,1.1-0.9c0.6,0,1,0.5,0.9,1.1l-1,14c0,0.5-0.5,0.9-1,0.9h5c0.5,0,0.9-0.4,1-0.9l2-16 C27,14.8,26.9,14.6,26.7,14.3z"></path> <g> <path d="M25.8,12L25.8,12L6.2,12c-0.4,0-0.8-0.3-0.9-0.7C5.1,10.9,5,10.5,5,10c0-1.5,0.8-2.8,2-3.5C7,6.4,7,6.2,7,6 c0-2.2,1.8-4,4-4c0.5,0,1,0.1,1.4,0.3C13.1,0.9,14.4,0,16,0s2.9,0.9,3.6,2.3C20,2.1,20.5,2,21,2c2.2,0,4,1.8,4,4c0,0.2,0,0.4,0,0.5 c1.2,0.7,2,2,2,3.5c0,0.5-0.1,0.9-0.2,1.3C26.6,11.7,26.3,12,25.8,12z M7,10l18,0c0,0,0,0,0,0c0-0.9-0.6-1.7-1.5-1.9 C23.2,8,23,7.8,22.9,7.6c-0.1-0.3-0.1-0.6,0-0.8C23,6.5,23,6.2,23,6c0-1.1-0.9-2-2-2c-0.5,0-1,0.2-1.3,0.5c-0.3,0.3-0.7,0.3-1,0.2 C18.3,4.6,18,4.2,18,3.9C17.9,2.8,17,2,16,2s-1.9,0.8-2,1.9c0,0.4-0.3,0.7-0.6,0.9c-0.4,0.1-0.8,0.1-1-0.2C12,4.2,11.5,4,11,4 C9.9,4,9,4.9,9,6c0,0.2,0,0.5,0.1,0.7c0.1,0.3,0.1,0.6,0,0.8C9,7.8,8.8,8,8.5,8.1C7.6,8.3,7,9.1,7,10L7,10z"></path> </g> </g></svg>
  );
};
export default function NavbarComponent() {
  return (
    <div>
    <Navbar maxWidth="full">
      <NavbarBrand>
        <SceneLogo />
        <Spacer x={4}/>
        <p className="font-bold text-inherit">Filmdatenbank</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Suche
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Neuer Film
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Inventur
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Github />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
    </div>
  );
}
