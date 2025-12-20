
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
    }
}
