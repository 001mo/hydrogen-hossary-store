/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const {cart, session} = context;
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  try {
    // Obtain a customer access token
    // https://shopify.dev/docs/custom-storefronts/building-with-the-storefront-api/customer-accounts#step-3-create-an-access-token
    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    // Sync customerAccessToken with existing cart
    const result = await cart.updateBuyerIdentity({customerAccessToken});

    // Update cart id in cookie
    const headers = cart.setCartId(result.cart.id);

    // Update session
    headers.append('Set-Cookie', await session.commit());

    return redirect(params.locale ? `/${params.locale}/account` : '/account', {
      headers,
    });
  } catch (error) {
    return 'something went wrong';
  }
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
