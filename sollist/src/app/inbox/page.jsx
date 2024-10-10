// app/inbox/page.jsx
import React from "react";
import InboxPage from "./InboxPage";

export default function InboxPageWrapper({ searchParams }) {
  const listingId = searchParams.listing || null;
  return <InboxPage listingId={listingId} />;
}
