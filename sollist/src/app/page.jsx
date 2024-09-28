
import Image from "next/image";
import AuthForm from "./components/AuthForm";
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import SearchBar from "@/components/ui/searchbar";

export default async function home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: session } = await supabase.auth.getSession();
  const user = session?.user;
  const { data: listings } = await supabase
    .from('listing')
    .select('*')
    .order('created_at', { ascending: false });

   

  return (
    (<div className="flex flex-col min-h-screen">
      <header className="bg-background">
        <div className=" px-4 md:px-6 py-4 flex items-center justify-between">
          <Link
            href="#"
            className="flex items-center gap-2 font-semibold text-lg"
            prefetch={false}>
            
            <span>DegenBaazar</span>
          </Link>
         
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/create-listing"
              className="text-sm  hover:text-primary"
              prefetch={false}>
              create listing
            </Link>
            <Link
              href="#"
              className="text-sm hover:text-primary"
              prefetch={false}>
              connect wallet
            </Link>
            {user ? (
              <>
                <Link
                  href="#"
                  className="text-sm font-medium hover:text-primary"
                  prefetch={false}>
                  My Listings
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium hover:text-primary"
                  prefetch={false}>
                  Messages
                </Link>
                <Button size="sm">Profile</Button>
              </>
            ) : (
              <>
                
                <Button size="sm" variant="outline">Login</Button>
              </>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="md:hidden">
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2 font-semibold text-lg">
                  <Package2Icon className="h-6 w-6" />
                  <span>Satoshi's List</span>
                </div>
                <nav className="grid gap-2">
                  <Link
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                    prefetch={false}>
                    <SearchIcon className="h-4 w-4" />
                    <span>Search</span>
                  </Link>
                  <Link
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                    prefetch={false}>
                    <ShuffleIcon className="h-4 w-4" />
                    <span>Swap</span>
                  </Link>
                  {user ? (
                    <>
                      <Link
                        href="#"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                        prefetch={false}>
                        <LayoutDashboardIcon className="h-4 w-4" />
                        <span>My Listings</span>
                      </Link>
                      <Link
                        href="#"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                        prefetch={false}>
                        <InboxIcon className="h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                      <Button size="sm" className="w-full">
                        Profile
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/create-listing"
                        className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                        prefetch={false}>
                        <ShoppingBagIcon className="h-4 w-4" />
                        <span>Create Listing</span>
                      </Link>
                      <Button size="sm" variant="outline" className="w-full">
                       <Link href="/components/AuthForm">Login</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-1  px-4 md:px-6 py-8">
        <div>
          <div>
            <h1 className="text-xl font-semibold mt-8 text-center">Buy and Sell anything with Stablecoins</h1>
            <SearchBar />
            <div className="px-16">
              <h3 className="text-lg font-semibold my-4">Recent Listings</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-6">
                {listings && listings.map((listing) => (
                  <Link href={`/listing/${listing.id}`} key={listing.id}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <img
                        src={listing.image_url || "/placeholder.svg"}
                        alt={listing.title}
                        width={400}
                        height={300}
                        className="rounded-t-lg object-cover w-full aspect-[4/3]" />
                      <CardContent className="p-4">
                        <div className="text-primary font-semibold">${listing.price} USDC</div>
                        <h3 className="text-lg font-semibold">{listing.title}</h3>
                        <p className="text-muted-foreground text-sm">{listing.location}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>)
  );
}

function BookOpenIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>)
  );
}


function InboxIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path
        d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>)
  );
}


function LayoutDashboardIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>)
  );
}


function MapPinIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>)
  );
}


function MenuIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>)
  );
}


function Package2Icon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>)
  );
}


function PuzzleIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path
        d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>)
  );
}


function SearchIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>)
  );
}


function ShirtIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path
        d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>)
  );
}


function ShoppingBagIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>)
  );
}


function ShuffleIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
      <path d="m18 14 4 4-4 4" />
    </svg>)
  );
}


function TruckIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path
        d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>)
  );
}
