const calls: string[] = [];
const realFetch = globalThis.fetch;
(globalThis as any).fetch = async (url: any, init: any = {}) => {
  const u = String(url?.url ?? url);
  const body = init.body && typeof init.body === 'string' ? JSON.parse(init.body) : init.body ? `<${init.body.length ?? init.body.byteLength} bytes>` : undefined;
  calls.push(`${init.method ?? 'GET'} ${u} ${typeof body === 'object' ? JSON.stringify(body).slice(0, 260) : body ?? ''}`);
  if (u.includes('/media/upload')) return Response.json({ media_id: 'm1', upload_url: 'https://s3.example/put' });
  if (u.startsWith('https://s3.example')) return new Response(null, { status: 200 });
  if (u.includes('/media/m1')) return Response.json({ status: 'ready' });
  if (u.includes('/drafts')) return Response.json({ id: 99 });
  if (u.includes('blob.vercel-storage.com') || u.includes('vercel.com/api/blob')) return Response.json({ url: 'https://blob.example/x', pathname: 'x', contentType: 'image/png', contentDisposition: '', downloadUrl: 'https://blob.example/x' });
  if (u.includes('api.buffer.com')) return Response.json({ data: { createPost: { post: { id: 'b1' } } } });
  return realFetch(url, init);
};
Object.assign(process.env, { TYPEFULLY_API_KEY: 'k', TYPEFULLY_SOCIAL_SET_ID: '335974', BUFFER_ACCESS_TOKEN: 't', BUFFER_LINKEDIN_CHANNEL_ID: '6ab81cf5ea19ca0bdef93dc8', BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_store_abc' });
const { schedulePost } = await import('./lib/studio/publish.ts');
const at = new Date('2026-10-01T06:30:00Z');
const slides = [{ kind: 'cover', title: 'A', body: 'b' }, { kind: 'list', title: 'B', items: ['x'] }, { kind: 'steps', title: 'C', items: ['y'] }, { kind: 'benefits', title: 'D', items: ['z'] }, { kind: 'cta', title: 'E', body: 'f' }];
console.log(await schedulePost({ id: 'p1', account: 'perso', kind: 'carousel', title: 'T', body: 'B', media: { slides } } as any, at));
try { console.log(await schedulePost({ id: 'p2', account: 'reco', kind: 'visual', title: 'T', body: 'B', media: { visual: { style: 'raffine', kicker: 'K', headline: 'H' } } } as any, at)); } catch (e: any) { console.log('buffer err', e.message); }
console.log(calls.join('\n'));
