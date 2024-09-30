import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageContent from "@/components/HomePageContent";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: session } = await supabase.auth.getSession();
  const user = session?.user;
  const { data: listings } = await supabase
    .from('listing')
    .select('*')
    .order('created_at', { ascending: false });

  return <HomePageContent user={user} listings={listings} />;
}