import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ListingPage({ params }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  const { data: listing } = await supabase
    .from('listing')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!listing) {
    return <div>Listing not found</div>;
  }

  return (
    <div>
      <h1>{listing.title}</h1>
      <img src={listing.image_url || "/placeholder.svg"} alt={listing.title} />
      <p>Price: ${listing.price} USDC</p>
      <p>Location: {listing.location}</p>
      {/* Add more details as needed */}
    </div>
  );
}
