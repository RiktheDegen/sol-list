import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import HomePageContent from "@/components/HomePageContent";
import InviteCodeScreen from "@/components/InviteCodeScreen";

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: session } = await supabase.auth.getSession();
  const user = session?.user;
  const { data: listings } = await supabase
    .from('listing')
    .select('*')
    .order('created_at', { ascending: false });

  // Get invite code from cookies
  const inviteCode = cookieStore.get('inviteCode');

  // If no invite code is present, show the invite code screen
  if (!inviteCode) {
    return <InviteCodeScreen />;
  }

  return <HomePageContent user={user} listings={listings} />;
}