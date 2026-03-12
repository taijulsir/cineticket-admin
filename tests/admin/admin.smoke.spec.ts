import { expect, test } from '@playwright/test';
import path from 'path';

test.describe.serial('Admin Smoke', () => {
  const loginEmail = 'admin@example.com';
  const loginPassword = 'Password@123';
  const posterPath = path.join(process.cwd(), 'tests/admin/fixtures/poster.png');
  const apiBase = 'http://localhost:5001/api';

  let createdEventName = '';
  let createdEventId = '';
  let createdShowId = '';
  let countryId = '';
  let stateId = '';
  let cityId = '';
  let theaterId = '';
  let hallId = '';
  let accessToken = '';
  let refreshToken = '';

  function authHeaders() {
    return { Authorization: `Bearer ${accessToken}` };
  }

  async function login(page: any, request: any) {
    if (accessToken && refreshToken) {
      await page.context().addCookies([{ name: 'ct_access', value: accessToken, url: 'http://localhost:3000' }]);
      await page.goto('/login');
      await page.evaluate(([at, rt]) => {
        localStorage.setItem('ct_access_token', at);
        localStorage.setItem('ct_refresh_token', rt);
      }, [accessToken, refreshToken]);
      await page.goto('/');
      await expect(page).toHaveURL('/');
      return;
    }
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible();
    let loginRes = await request.post(`${apiBase}/auth/login`, {
      data: { email: loginEmail, password: loginPassword, role: 'Admin' },
    });
    if (loginRes.status() === 429) {
      await page.waitForTimeout(65_000);
      loginRes = await request.post(`${apiBase}/auth/login`, {
        data: { email: loginEmail, password: loginPassword, role: 'Admin' },
      });
    }
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    accessToken = loginBody?.data?.accessToken ?? loginBody?.accessToken;
    refreshToken = loginBody?.data?.refreshToken ?? loginBody?.refreshToken;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    await page.context().addCookies([{ name: 'ct_access', value: accessToken, url: 'http://localhost:3000' }]);
    await page.evaluate(([at, rt]) => {
      localStorage.setItem('ct_access_token', at);
      localStorage.setItem('ct_refresh_token', rt);
    }, [accessToken, refreshToken]);
    await page.goto('/');
    await expect(page).toHaveURL('/');
  }

  test('1. Admin login', async ({ page, request }) => {
    await login(page, request);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('2. Create event', async ({ page, request }) => {
    await login(page, request);
    createdEventName = `QA Event ${Date.now()}`;
    const slug = `qa-event-${Date.now()}`;
    const uploadRes = await request.post(`${apiBase}/admin/events/upload-poster`, {
      headers: authHeaders(),
      multipart: { file: { name: 'poster.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2f2hQAAAAASUVORK5CYII=', 'base64') } },
    });
    expect(uploadRes.ok()).toBeTruthy();
    const uploadBody = await uploadRes.json();
    const posterUrl = uploadBody?.data?.imageUrl ?? uploadBody?.imageUrl ?? '';
    const createRes = await request.post(`${apiBase}/admin/events`, {
      headers: authHeaders(),
      data: {
        name: createdEventName,
        slug,
        releaseType: 'THEATRICAL',
        trailerVideoLink: 'https://example.com/trailer',
        status: 'UPCOMING',
        description: 'QA event',
        location: 'Sydney',
        organizer: 'CineTicket',
        type: 'MOVIE',
        cardImage: 'https://example.com/card.jpg',
        posterUrl,
        bannerImage: 'https://example.com/banner.jpg',
        releaseDate: new Date().toISOString(),
        duration: '120m',
        eventCurrency: 'AUD',
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const payload = await createRes.json();
    createdEventId = payload?.data?.id;
    const listRes = await request.get(`${apiBase}/events?page=1&limit=100`);
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    const eventIds = (listBody?.data?.data ?? []).map((e: any) => e.id);
    expect(eventIds).toContain(createdEventId);
    await page.goto('/events');
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();
  });

  test('3. Create theater', async ({ page, request }) => {
    await login(page, request);
    const showsRes = await request.get(`${apiBase}/shows?page=1&limit=1`);
    const showsBody = await showsRes.json();
    const show = showsBody.data.data[0];
    countryId = show.countryId;
    stateId = show.stateId;
    cityId = show.cityId;
    const theaterRes = await request.post(`${apiBase}/admin/theaters`, {
      headers: authHeaders(),
      data: {
        name: `QA Theater ${Date.now()}`,
        countryId,
        stateId,
        cityId,
        address: '100 QA Street',
        zipCode: '2000',
      },
    });
    expect(theaterRes.ok()).toBeTruthy();
    const theaterBody = await theaterRes.json();
    theaterId = theaterBody?.data?.id;
    expect(theaterId).not.toBe('');
    await page.goto('/theaters');
    await expect(page.getByRole('heading', { name: 'Theater & Hall Management' })).toBeVisible();
  });

  test('4. Create hall', async ({ page, request }) => {
    await login(page, request);
    const hallRes = await request.post(`${apiBase}/admin/halls`, {
      headers: authHeaders(),
      data: {
        theaterId,
        name: `QA Hall ${Date.now()}`,
        numberOfRows: 5,
        numberOfColumns: 10,
      },
    });
    expect(hallRes.ok()).toBeTruthy();
    const hallBody = await hallRes.json();
    hallId = hallBody?.data?.id;
    expect(hallId).not.toBe('');
    await page.goto('/theaters');
    await expect(page.getByRole('heading', { name: 'Theater & Hall Management' })).toBeVisible();
  });

  test('5. Generate hall seats', async ({ page, request }) => {
    await login(page, request);
    const seatRes = await request.post(`${apiBase}/admin/hall-seats`, {
      headers: authHeaders(),
      data: { hallId, row: 1, column: 1, seatId: `A1-${Date.now()}`, seatName: 'A1', seatType: 'STANDARD' },
    });
    expect(seatRes.ok()).toBeTruthy();
    await page.goto('/theaters');
    await expect(page.getByRole('heading', { name: 'Theater & Hall Management' })).toBeVisible();
  });

  test('6. Create show', async ({ page, request }) => {
    await login(page, request);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const showRes = await request.post(`${apiBase}/admin/shows`, {
      headers: authHeaders(),
      data: {
        eventId: createdEventId,
        hallId,
        cityId,
        stateId,
        countryId,
        theaterId,
        startTime: '18:00',
        endTime: '20:00',
        date: tomorrow.toISOString(),
        totalSeats: 50,
      },
    });
    expect(showRes.ok()).toBeTruthy();
    const showBody = await showRes.json();
    createdShowId = showBody?.data?.id;
    const showsRes = await request.get(`${apiBase}/shows?page=1&limit=100`);
    expect(showsRes.ok()).toBeTruthy();
    const showsBody = await showsRes.json();
    const showIds = (showsBody?.data?.data ?? []).map((s: any) => s.id);
    expect(showIds).toContain(createdShowId);
    await page.goto('/shows');
    await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
  });

  test('7. Load seat map', async ({ page, request }) => {
    await login(page, request);
    const seatMapRes = await request.get(`${apiBase}/shows/${createdShowId}/seat-map`);
    expect(seatMapRes.ok()).toBeTruthy();
    const seatMapBody = await seatMapRes.json();
    const rows = seatMapBody?.data?.rows ?? [];
    expect(Array.isArray(rows)).toBeTruthy();
    await page.goto('/shows');
    await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
  });

  test('8. View dashboard stats', async ({ page, request }) => {
    await login(page, request);
    const statsRes = await request.get(`${apiBase}/admin/stats`, { headers: authHeaders() });
    expect(statsRes.ok()).toBeTruthy();
    await page.goto('/');
    await expect(page.getByText('Total Events')).toBeVisible();
  });

  test('9. View orders list', async ({ page, request }) => {
    await login(page, request);
    const ordersRes = await request.get(`${apiBase}/orders?page=1&limit=20`, { headers: authHeaders() });
    expect(ordersRes.ok()).toBeTruthy();
    await page.goto('/orders');
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible();
  });

  test('10. Create promo code', async ({ page, request }) => {
    await login(page, request);
    const code = `QA${Date.now()}`;
    const promoRes = await request.post(`${apiBase}/admin/promo-codes`, {
      headers: authHeaders(),
      data: {
        promoCode: code,
        maxlimit: 10,
        discountType: 'PERCENTAGE',
        discountAmount: 10,
        isActive: true,
      },
    });
    expect(promoRes.ok()).toBeTruthy();
    await page.goto('/promo-codes');
    await expect(page.getByRole('heading', { name: 'Promo Codes' })).toBeVisible();
  });
});
