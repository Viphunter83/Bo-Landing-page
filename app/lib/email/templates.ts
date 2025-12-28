
export const EmailTemplates = {
  orderConfirmation: (order: any) => {
    const itemsList = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #333;">${item.name} <span style="font-size: 12px; color: #888;">x${item.quantity}</span></td>
        <td style="padding: 10px; border-bottom: 1px solid #333; text-align: right;">${item.price}</td>
      </tr>
    `).join('')

    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px;">
        <h1 style="color: #eab308;">Order Confirmed! 🍜</h1>
        <p>Hi there! Thanks for ordering from Bo Dubai.</p>
        
        <div style="background-color: #111; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsList}
          </table>
          <div style="margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold;">
            Total: ${order.total}
          </div>
        </div>

        ${order.type === 'delivery' ? `
          <div style="margin-bottom: 20px;">
            <strong>Delivery Address:</strong><br/>
            ${order.address}<br/>
            ${order.apartment ? `Apt: ${order.apartment}` : ''}
          </div>
        ` : '<p><strong>Pickup Order</strong></p>'}

        <p style="color: #888; font-size: 12px;">
          If you have any questions, reply to this email or contact us via WhatsApp.
        </p>
      </div>
    `
  },

  bookingConfirmation: (booking: any) => {
    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px;">
        <h1 style="color: #eab308;">Table Reserved! 🗓️</h1>
        <p>Hi ${booking.name}, your table request has been received.</p>
        
        <div style="background-color: #111; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Date:</strong> ${booking.date}</p>
          <p><strong>Time:</strong> ${booking.time}</p>
          <p><strong>Guests:</strong> ${booking.guests}</p>
        </div>

        <p>We will contact you shortly to confirm availability.</p>
        
        <p style="color: #888; font-size: 12px;">
          Bo Dubai Team
        </p>
      </div>
    `
  },

  marketingPromo: (segment: string) => {
    let content = ''
    if (segment === 'spicy') {
      content = `
            <h1 style="color: #ef4444;">Too Hot To Handle? 🌶️</h1>
            <p>We noticed you love spicy food. Come try our new Bun Bo Hue - it's fire!</p>
            <a href="https://bo-restaurant-dubai.vercel.app" style="display: inline-block; background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Menu</a>
          `
    } else {
      content = `
            <h1 style="color: #22c55e;">Fresh & Healthy 🌱</h1>
            <p>Looking for a light lunch? Our Summer Rolls are waiting for you.</p>
            <a href="https://bo-restaurant-dubai.vercel.app" style="display: inline-block; background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Order Now</a>
          `
    }

    return `
        <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
            ${content}
            <p style="margin-top: 30px; color: #666; font-size: 12px;">Unsubscribe managed by Bo Team.</p>
        </div>
      `
  },

  quizCoupon: (code: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: #eab308;">You've Unlocked 10% Off! 🎁</h1>
        <p>Thanks for taking the Bo Vibe Check.</p>
        
        <div style="background-color: #111; padding: 30px; border: 2px dashed #eab308; border-radius: 10px; margin: 30px 0; display: inline-block;">
          <span style="display: block; color: #888; font-size: 14px; margin-bottom: 5px;">Your Promo Code:</span>
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #fff;">${code}</span>
        </div>

        <p>Show this email to your waiter or use it for your next online order.</p>
        
        <a href="https://bo-restaurant-dubai.vercel.app" style="display: inline-block; background-color: #eab308; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Order Now</a>
        
        <p style="margin-top: 40px; color: #666; font-size: 12px;">Valid for 7 days. One use per customer.</p>
      </div>
    `
  },

  reviewRequest: (name: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: #eab308;">How was it, ${name}? ⭐</h1>
        <p>We hope you enjoyed your meal at Bo Dubai!</p>
        <p>Your opinion helps us get better (and tastier).</p>
        
        <div style="margin: 30px 0;">
            <a href="https://maps.google.com/?cid=YOUR_GOOGLE_MAPS_ID" style="background-color: #333; color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; border: 1px solid #555; font-weight: bold;">Leave a Review & Get Dessert 🍰</a>
        </div>

        <p style="color: #888; font-size: 12px;">Just show your review screenshot next time you visit!</p>
      </div>
    `
  },

  birthday: (name: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: #eab308;">Happy Birthday, ${name}! 🎂</h1>
        <p>It's your special day, and we want to celebrate with you.</p>
        
        <div style="background-color: #111; padding: 30px; border: 2px solid #eab308; border-radius: 10px; margin: 30px 0;">
             <h2 style="color: #fff; margin: 0;">20% OFF YOUR BILL</h2>
             <p style="color: #888; margin-top: 10px;">Valid today only!</p>
        </div>

        <a href="https://bo-restaurant-dubai.vercel.app/book" style="display: inline-block; background-color: #eab308; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Book Your Table</a>
      </div>
    `
  },

  winBack: (name: string) => {
    return `
      <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="color: #eab308;">We Miss You, ${name} 🥺</h1>
        <p>It's been a while since we've seen you. The Pho is lonely without you!</p>
        
        <p>Here's a little reason to come back:</p>
        
        <div style="background-color: #111; padding: 20px; margin: 20px 0; border-radius: 10px;">
            <span style="color: #38bdf8; font-weight: bold; font-size: 20px;">FREE DRINK ON US 🍹</span>
        </div>

        <a href="https://bo-restaurant-dubai.vercel.app/order" style="display: inline-block; background-color: #38bdf8; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Order Now</a>
      </div>
    `
  }
}
