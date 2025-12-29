import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content')

// 获取所有章节
export function getAllChapters() {
  try {
    const chaptersDirectory = path.join(contentDirectory, 'chapters')
    const fileNames = fs.readdirSync(chaptersDirectory)
    
    const chapters = fileNames
      .filter(name => name.endsWith('.json'))
      .map(fileName => {
        const fullPath = path.join(chaptersDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf8')
        const chapterData = JSON.parse(fileContents)
        
        return {
          id: fileName.replace('.json', ''),
          ...chapterData
        }
      })
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    
    return chapters
  } catch (error) {
    console.error('Error reading chapters:', error)
    return []
  }
}

// 获取单个章节
export function getChapterById(id: string) {
  try {
    const fullPath = path.join(contentDirectory, 'chapters', `${id}.json`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const chapterData = JSON.parse(fileContents)
    
    return {
      id,
      ...chapterData
    }
  } catch (error) {
    console.error(`Error reading chapter ${id}:`, error)
    return null
  }
}

// 获取所有新闻
export function getAllNews() {
  try {
    const newsDirectory = path.join(contentDirectory, 'news')
    const fileNames = fs.readdirSync(newsDirectory)
    
    const allNewsData = fileNames.map(fileName => {
      const fullPath = path.join(newsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)
      
      return {
        slug: fileName.replace('.md', ''),
        ...matterResult.data,
        content: matterResult.content
      }
    })
    
    return allNewsData.sort((a: any, b: any) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    )
  } catch (error) {
    console.error('Error reading news:', error)
    return []
  }
}

// 获取单条新闻
export function getNewsBySlug(slug: string) {
  try {
    const fullPath = path.join(contentDirectory, 'news', `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)
    
    return {
      slug,
      ...matterResult.data,
      content: matterResult.content
    }
  } catch (error) {
    console.error(`Error reading news ${slug}:`, error)
    return null
  }
}

// 获取所有人物
export function getAllCharacters() {
  try {
    const charactersDirectory = path.join(contentDirectory, 'characters')
    const fileNames = fs.readdirSync(charactersDirectory)
    
    const allCharactersData = fileNames.map(fileName => {
      const fullPath = path.join(charactersDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)
      
      return {
        slug: fileName.replace('.md', ''),
        ...matterResult.data,
        content: matterResult.content
      }
    })
    
    return allCharactersData.sort((a: any, b: any) => 
      (a.name || '').localeCompare(b.name || '')
    )
  } catch (error) {
    console.error('Error reading characters:', error)
    return []
  }
}

// 获取单个人物
export function getCharacterBySlug(slug: string) {
  try {
    const fullPath = path.join(contentDirectory, 'characters', `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const matterResult = matter(fileContents)
    
    return {
      slug,
      ...matterResult.data,
      content: matterResult.content
    }
  } catch (error) {
    console.error(`Error reading character ${slug}:`, error)
    return null
  }
}