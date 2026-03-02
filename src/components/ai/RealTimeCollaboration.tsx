"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IndexedDBModelStorage } from '@/lib/modelStorage'
import { 
  Users, 
  MessageSquare, 
  Activity, 
  Settings, 
  Plus,
  Search,
  Bell,
  UserPlus,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Wifi,
  WifiOff
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  avatar?: string
  isOnline: boolean
  lastActive: Date
}

interface Project {
  id: string
  name: string
  description: string
  owner: string
  members: TeamMember[]
  isPublic: boolean
  createdAt: Date
  lastModified: Date
  models: number
  datasets: number
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  type: 'model' | 'dataset' | 'workflow'
  targetId: string
}

interface Activity {
  id: string
  user: string
  action: string
  target: string
  timestamp: Date
  type: 'create' | 'update' | 'delete' | 'comment' | 'share' | 'complete' | 'upload' | 'review'
}

function RealTimeCollaboration() {
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'members' | 'activity' | 'comments' | 'settings'>('members')
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [onlineUsers, setOnlineUsers] = useState<number>(3)
  
  const [projects, setProjects] = useState<Project[]>(() => {
    const now = Date.now()
    return [
      {
        id: 'project_1',
        name: 'AI 모델 개발 프로젝트',
        description: '이미지 분류 모델 개발 및 최적화',
        owner: '김민준',
        members: [
          { id: 'user_1', name: '김민준', email: 'kim@example.com', role: 'owner', isOnline: true, lastActive: new Date() },
          { id: 'user_2', name: '이서연', email: 'lee@example.com', role: 'admin', isOnline: true, lastActive: new Date(now - 300000) },
          { id: 'user_3', name: '박현준', email: 'park@example.com', role: 'editor', isOnline: false, lastActive: new Date(now - 3600000) }
        ],
        isPublic: false,
        createdAt: new Date(now - 86400000 * 7),
        lastModified: new Date(),
        models: 3,
        datasets: 2
      },
      {
        id: 'project_2',
        name: '데이터 분석 연구',
        description: '대규모 데이터셋 분석 및 시각화',
        owner: '이영희',
        members: [
          { id: 'user_4', name: '이영희', email: 'yi@example.com', role: 'owner', isOnline: true, lastActive: new Date() },
          { id: 'user_5', name: '최지아', email: 'choi@example.com', role: 'editor', isOnline: true, lastActive: new Date(now - 600000) }
        ],
        isPublic: true,
        createdAt: new Date(now - 86400000 * 14),
        lastModified: new Date(now - 3600000),
        models: 1,
        datasets: 5
      }
    ]
  })

  const [activities, setActivities] = useState<Activity[]>(() => {
    const now = Date.now()
    return [
      {
        id: 'activity_1',
        user: '김민준',
        action: '모델을 학습 중입니다',
        target: 'Classification Model v2',
        timestamp: new Date(now - 1800000),
        type: 'update'
      },
      {
        id: 'activity_2',
        user: '이서연',
        action: '데이터셋을 업로드했습니다',
        target: 'Training Data v3',
        timestamp: new Date(now - 3600000),
        type: 'upload'
      },
      {
        id: 'activity_3',
        user: '박현준',
        action: '최적화 결과를 공유했습니다',
        target: 'Hyperparameter Results',
        timestamp: new Date(now - 7200000),
        type: 'share'
      }
    ]
  })

  const [comments, setComments] = useState<Comment[]>(() => {
    const now = Date.now()
    return [
      {
        id: 'comment_1',
        author: '김민준',
        content: '모델 성능이 85%까지 향상되었습니다. 현재 결과를 공유합니다.',
        timestamp: new Date(now - 1800000),
        type: 'model',
        targetId: 'model_1'
      },
      {
        id: 'comment_2',
        author: '이서연',
        content: '데이터 전처리 방법을 개선하여 더 나은 결과를 얻을 수 있을 것 같습니다.',
        timestamp: new Date(now - 3600000),
        type: 'dataset',
        targetId: 'dataset_1'
      }
    ]
  })

  const [newComment, setNewComment] = useState<string>('')
  const [inviteEmail, setInviteEmail] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor')
  const modelStorage = React.useMemo(() => new IndexedDBModelStorage(), [])

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        await modelStorage.init()
        const models = await modelStorage.listModels()
        if (models.length > 0) {
          setProjects(prev => prev.map(p => ({
            ...p,
            models: models.length,
            datasets: Math.max(p.datasets, models.length - 1)
          })))
        }
      } catch (e) {
        console.error('Failed to load saved models:', e)
      }
    }

    loadProjectData()

    const interval = setInterval(() => {
      const users = ['이영희', '박민준', '최지아', '강동원', '정우성', '김민수', '이서연', '박현준']
      const actions = [
        { action: '모델을 학습 중입니다', type: 'update' as const, target: '모델' },
        { action: '데이터셋을 정제했습니다', type: 'update' as const, target: '데이터' },
        { action: '새로운 실험을 시작했습니다', type: 'create' as const, target: '실험' },
        { action: '최적화 결과를 공유했습니다', type: 'share' as const, target: '결과' },
        { action: '모델 해석을 완료했습니다', type: 'complete' as const, target: '분석' },
        { action: '댓글을 남겼습니다', type: 'comment' as const, target: '토론' },
        { action: '파일을 업로드했습니다', type: 'upload' as const, target: '파일' },
        { action: '코드를 검토했습니다', type: 'review' as const, target: '코드' }
      ]

      if (Math.random() > 0.6) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomAction = actions[Math.floor(Math.random() * actions.length)]
        
        const newActivity: Activity = {
          id: `activity_${Date.now()}_${Math.random()}`,
          user: randomUser,
          action: randomAction.action,
          target: randomAction.target,
          timestamp: new Date(),
          type: randomAction.type
        }

        setActivities(prev => [newActivity, ...prev.slice(0, 19)])

        if (randomAction.type === 'comment') {
          const commentTexts = [
            '실시간 분석 결과가 매우 흥미롭네요!',
            '이 모델의 성능이 정말 좋아요.',
            '데이터 전처리 방법에 대해 논의해봐요.',
            '최적화 결과를 공유해주셔서 감사합니다.',
            '다음 실험은 어떤 방향으로 진행할까요?',
            '모델 해석 결과가 매우 명확하네요.',
            '협업해서 더 좋은 결과를 만들어봐요!',
            '이번 분석 방법이 효과적이었어요.'
          ]
          
          const newCommentObj: Comment = {
            id: `comment_${Date.now()}_${Math.random()}`,
            author: randomUser,
            content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
            timestamp: new Date(),
            type: 'model',
            targetId: 'current'
          }
          setComments(prev => [newCommentObj, ...prev.slice(0, 14)])
        }
      }

      setIsConnected(() => Math.random() > 0.05)
      setOnlineUsers(o => {
        const change = Math.random() > 0.5 ? 1 : -1
        return Math.min(10, Math.max(1, o + change))
      })
    }, 4000)

    return () => clearInterval(interval)
  }, [modelStorage])

  const currentProject = projects.find(p => p.id === selectedProject)

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: '현재 사용자',
      content: newComment,
      timestamp: new Date(),
      type: 'model',
      targetId: 'current'
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const inviteMember = () => {
    if (!inviteEmail.trim()) return

    const newMember: TeamMember = {
      id: `user_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: selectedRole,
      isOnline: false,
      lastActive: new Date()
    }

    if (currentProject) {
      setProjects(prev => prev.map(p => 
        p.id === selectedProject 
          ? { ...p, members: [...p.members, newMember] }
          : p
      ))
    }

    setInviteEmail('')
  }

  const formatTimeAgo = React.useCallback((date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return '방금 전'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
    return `${Math.floor(seconds / 86400)}일 전`
  }, [])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />
      case 'update': return <Activity className="w-4 h-4 text-blue-600" />
      case 'delete': return <EyeOff className="w-4 h-4 text-red-600" />
      case 'comment': return <MessageSquare className="w-4 h-4 text-purple-600" />
      case 'share': return <Upload className="w-4 h-4 text-orange-600" />
      case 'complete': return <Eye className="w-4 h-4 text-green-600" />
      case 'upload': return <Download className="w-4 h-4 text-blue-600" />
      case 'review': return <Settings className="w-4 h-4 text-gray-600" />
      default: return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-indigo-600" />
          실시간 협업
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm text-gray-600">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">{onlineUsers}명 온라인</span>
          </div>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            알림
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 왼쪽: 프로젝트 선택 및 기본 정보 */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              프로젝트 선택
            </h3>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="프로젝트를 선택하세요">
                  {currentProject ? currentProject.name : "프로젝트를 선택하세요"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-xs text-gray-500">{project.members.length}명 참여</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentProject && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                팀원 정보
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 팀원</span>
                  <span className="font-medium">{currentProject.members.length}명</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">온라인</span>
                  <span className="font-medium text-green-600">
                    {currentProject.members.filter(m => m.isOnline).length}명
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">모델</span>
                  <span className="font-medium">{currentProject.models}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">데이터셋</span>
                  <span className="font-medium">{currentProject.datasets}개</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              실시간 상태
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">연결 상태</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? '정상' : '끊김'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">동기화</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">자동 저장</span>
                <Switch checked={true} />
              </div>
            </div>
          </div>
        </div>

        {/* 중앙: 주요 콘텐츠 영역 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 탭 네비게이션 */}
          <div className="bg-white border rounded-lg p-1 flex">
            {(['members', 'activity', 'comments', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'members' && '팀원'}
                {tab === 'activity' && '활동'}
                {tab === 'comments' && '댓글'}
                {tab === 'settings' && '설정'}
              </button>
            ))}
          </div>

          {/* 팀원 탭 */}
          {activeTab === 'members' && currentProject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    팀원 관리
                  </span>
                  <Button size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    초대
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentProject.members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role === 'owner' ? '소유자' : 
                         member.role === 'admin' ? '관리자' :
                         member.role === 'editor' ? '편집자' : '참관자'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(member.lastActive)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 활동 탭 */}
          {activeTab === 'activity' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  최근 활동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.user}</div>
                        <div className="text-sm text-gray-600">{activity.action}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {activity.target} • {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 댓글 탭 */}
          {activeTab === 'comments' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  팀 댓글
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="댓글을 입력하세요..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <Button onClick={addComment}>
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">{comment.author}</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</div>
                      </div>
                      <div className="text-sm text-gray-700">{comment.content}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 설정 탭 */}
          {activeTab === 'settings' && currentProject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  프로젝트 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">새 팀원 초대</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="이메일 주소"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Select value={selectedRole} onValueChange={(value: string) => setSelectedRole(value as 'editor' | 'viewer')}>
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          {selectedRole === 'editor' ? '편집자' : '참관자'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">편집자</SelectItem>
                        <SelectItem value="viewer">참관자</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={inviteMember}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">공개 프로젝트</span>
                    <Switch
                      checked={currentProject.isPublic}
                      onCheckedChange={(checked: boolean) => {
                        setProjects(projects.map(p => 
                          p.id === selectedProject 
                            ? { ...p, isPublic: checked }
                            : p
                        ))
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">댓글 허용</span>
                    <Switch checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">자동 동기화</span>
                    <Switch checked={true} />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">위험한 작업</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Lock className="w-4 h-4 mr-2" />
                      프로젝트 잠금
                    </Button>
                    <Button variant="destructive" size="sm" className="w-full">
                      <EyeOff className="w-4 h-4 mr-2" />
                      프로젝트 삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽: 실시간 정보 및 통계 */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              실시간 통계
            </h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{onlineUsers}</div>
                <div className="text-sm text-gray-600">온라인 사용자</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activities.length}</div>
                <div className="text-sm text-gray-600">오늘의 활동</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{comments.length}</div>
                <div className="text-sm text-gray-600">총 댓글 수</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              최근 알림
            </h3>
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 rounded text-sm">
                <div className="font-medium text-blue-800">새 댓글</div>
                <div className="text-blue-600">이서연님이 댓글을 남겼습니다</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-sm">
                <div className="font-medium text-green-800">모델 업데이트</div>
                <div className="text-green-600">김민준님이 모델을 업데이트했습니다</div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-sm">
                <div className="font-medium text-orange-800">새 팀원</div>
                <div className="text-orange-600">박현준님이 팀에 참여했습니다</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              온라인 팀원
            </h3>
            <div className="space-y-2">
              {currentProject?.members.filter(m => m.isOnline).map(member => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeCollaboration
