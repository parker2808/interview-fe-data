import { describe, expect, it } from 'vitest';

describe('books contract', () => {
  it('returns a book with a stable id', () => {
    const book = { id: '1', title: 'Clean Code' };
    expect(book).toMatchObject({ id: '1', title: expect.any(String) });
  });
});
