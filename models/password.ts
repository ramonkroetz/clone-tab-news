import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  const rounds = getNumberOfRounds()
  return await bcrypt.hash(password, rounds)
}

export async function comparePassword(providedPassword?: string, storedPassword?: string): Promise<boolean> {
  if (!providedPassword || !storedPassword) {
    return false
  }

  return await bcrypt.compare(providedPassword, storedPassword)
}

function getNumberOfRounds(): number {
  return process.env.NODE_ENV === 'production' ? 14 : 1
}
