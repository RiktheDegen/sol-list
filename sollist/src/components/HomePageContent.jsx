"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePageContent({ user, listings }) {
  return (
    <div className="flex flex-col relative">
      <main className="flex-1 px-4 md:px-6 py-8">
        <div>
          <div>
            <h1 className="text-3xl font-semibold mt-8 text-center">
              Buy and Sell Anything With Stablecoins
            </h1>
            <div className="px-4 md:px-16">
              <h3 className="text-lg font-semibold my-4">Recent Listings</h3>
              {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {listings &&
                    listings.map((listing) => (
                      <Link href={`/listing/${listing.id}`} key={listing.id}>
                        <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                          <div className="aspect-square relative overflow-hidden">
                            <img
                              src={listing.image_urls[0]}
                              alt={listing.title}
                              className="w-full h-full object-contain absolute inset-0"
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="text-primary font-semibold text-base flex text-[#5b5b5b]">
                              <svg
                                width="15"
                                height="15"
                                className="mr-1 mt-1"
                                viewBox="0 0 40 40"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <ellipse
                                  cx="17.6695"
                                  cy="18.2302"
                                  rx="17.6695"
                                  ry="18.2302"
                                  transform="matrix(-1 0 0 1 39.3833 2.16992)"
                                  fill="#144CC7"
                                  stroke="#0D0D0D"
                                  stroke-width="0.4"
                                  stroke-linejoin="round"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M13.8145 36.8012C16.1482 37.9736 18.7696 38.6313 21.5398 38.6313C28.0514 38.6313 33.7403 34.9972 36.8052 29.5877L16.7147 24.752L13.8145 36.8012Z"
                                  fill="#699CFF"
                                />
                                <path
                                  d="M13.8145 36.8012L13.7247 36.9799C13.6417 36.9382 13.5983 36.8448 13.6201 36.7544L13.8145 36.8012ZM36.8052 29.5877L36.852 29.3932C36.913 29.4079 36.9636 29.4504 36.9886 29.508C37.0136 29.5656 37.0101 29.6316 36.9792 29.6862L36.8052 29.5877ZM16.7147 24.752L16.5203 24.7052C16.5327 24.6536 16.5651 24.6091 16.6103 24.5814C16.6556 24.5537 16.7099 24.5451 16.7615 24.5575L16.7147 24.752ZM13.9043 36.6225C16.2109 37.7813 18.8016 38.4313 21.5398 38.4313V38.8313C18.7375 38.8313 16.0855 38.1659 13.7247 36.9799L13.9043 36.6225ZM21.5398 38.4313C27.9743 38.4313 33.5993 34.8405 36.6312 29.4891L36.9792 29.6862C33.8813 35.154 28.1284 38.8313 21.5398 38.8313V38.4313ZM16.7615 24.5575L36.852 29.3932L36.7584 29.7821L16.6679 24.9464L16.7615 24.5575ZM13.6201 36.7544L16.5203 24.7052L16.9092 24.7988L14.0089 36.848L13.6201 36.7544Z"
                                  fill="#0D0D0D"
                                />
                                <ellipse
                                  cx="17.2005"
                                  cy="18.2302"
                                  rx="17.2005"
                                  ry="18.2302"
                                  transform="matrix(-1 0 0 1 35.0176 1.36914)"
                                  fill="white"
                                  stroke="#0D0D0D"
                                  stroke-width="0.4"
                                  stroke-linejoin="round"
                                />
                                <ellipse
                                  cx="13.6177"
                                  cy="14.6159"
                                  rx="13.6177"
                                  ry="14.6159"
                                  transform="matrix(-1 0 0 1 31.2797 4.98242)"
                                  stroke="#0D0D0D"
                                  stroke-width="0.4"
                                  stroke-linejoin="round"
                                />
                                <ellipse
                                  cx="17.6695"
                                  cy="18.2302"
                                  rx="17.6695"
                                  ry="18.2302"
                                  transform="matrix(-1 0 0 1 39.3833 2.16992)"
                                  fill="#144CC7"
                                  stroke="#0D0D0D"
                                  stroke-width="0.4"
                                  stroke-linejoin="round"
                                />
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M13.8145 36.8012C16.1482 37.9736 18.7696 38.6313 21.5398 38.6313C28.0514 38.6313 33.7403 34.9972 36.8052 29.5877L16.7147 24.752L13.8145 36.8012Z"
                                  fill="#699CFF"
                                />
                                <path
                                  d="M13.8145 36.8012L13.7247 36.9799C13.6417 36.9382 13.5983 36.8448 13.6201 36.7544L13.8145 36.8012ZM36.8052 29.5877L36.852 29.3932C36.913 29.4079 36.9636 29.4504 36.9886 29.508C37.0136 29.5656 37.0101 29.6316 36.9792 29.6862L36.8052 29.5877ZM16.7147 24.752L16.5203 24.7052C16.5327 24.6536 16.5651 24.6091 16.6103 24.5814C16.6556 24.5537 16.7099 24.5451 16.7615 24.5575L16.7147 24.752ZM13.9043 36.6225C16.2109 37.7813 18.8016 38.4313 21.5398 38.4313V38.8313C18.7375 38.8313 16.0855 38.1659 13.7247 36.9799L13.9043 36.6225ZM21.5398 38.4313C27.9743 38.4313 33.5993 34.8405 36.6312 29.4891L36.9792 29.6862C33.8813 35.154 28.1284 38.8313 21.5398 38.8313V38.4313ZM16.7615 24.5575L36.852 29.3932L36.7584 29.7821L16.6679 24.9464L16.7615 24.5575ZM13.6201 36.7544L16.5203 24.7052L16.9092 24.7988L14.0089 36.848L13.6201 36.7544Z"
                                  fill="#0D0D0D"
                                />
                                <ellipse
                                  cx="17.2005"
                                  cy="18.2302"
                                  rx="17.2005"
                                  ry="18.2302"
                                  transform="matrix(-1 0 0 1 35.0176 1.36914)"
                                  fill="white"
                                  stroke="#0D0D0D"
                                  stroke-width="0.4"
                                  stroke-linejoin="round"
                                />
                                <ellipse
                                  cx="13.6177"
                                  cy="14.6159"
                                  rx="13.6177"
                                  ry="14.6159"
                                  transform="matrix(-1 0 0 1 31.2797 4.98242)"
                                  stroke="#0D0D0D"
                                  stroke-width="0.4"
                                  stroke-linejoin="round"
                                />
                                <path
                                  d="M22.2013 21.1022C22.7857 23.275 21.6368 24.9634 19.6338 25.7631L20.0453 27.2928L18.8285 27.62L18.4218 26.1078C16.4202 26.4971 14.6889 25.8817 13.6143 24.3813L15.639 22.3455C16.2284 23.0817 16.8634 23.4328 17.683 23.3614L17.0378 20.9627C16.9589 20.9466 16.8673 20.9526 16.7884 20.9366C15.1125 20.735 13.0757 20.3695 12.4492 18.0403C11.8413 15.7806 13.2315 14.1578 15.0273 13.4884L14.6205 11.9761L15.8372 11.6488L16.2534 13.1958C17.7997 12.9849 19.2663 13.4479 20.3556 14.7952L18.3784 16.7996C17.9888 16.252 17.5476 15.9978 16.9968 15.9596L17.628 18.3062C19.3132 18.5426 21.5186 18.5644 22.2013 21.1022ZM15.235 17.3096C15.3238 17.6398 15.5551 17.8759 16.257 18.0599L15.766 16.2347C15.2947 16.492 15.1228 16.8924 15.235 17.3096ZM18.8904 22.9994C19.4393 22.684 19.5277 22.2501 19.4295 21.8851C19.3126 21.4505 18.9817 21.2599 18.3901 21.1395L18.8904 22.9994Z"
                                  fill="#2D2D2D"
                                />
                              </svg>
                              {listing.price}{" "}
                            </div>
                            <h3 className="font-semibold text-lg truncate">
                              {listing.title}
                            </h3>
                            <p className="text-muted-foreground text-sm truncate">
                              {listing.location}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No listings available at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <div className="w-[200%] h-[200vw] bg-[#E6F0FF] rounded-[100%] absolute bottom-[-100vw] left-[-50%]"></div>
        <div className="w-[150%] h-[150vw] bg-[#B3D4FF] rounded-[100%] absolute bottom-[-75vw] left-[-25%]"></div>
        <div className="w-[100%] h-[100vw] bg-[#80B8FF] rounded-[100%] absolute bottom-[-50vw] left-0"></div>
      </div>
    </div>
  );
}
