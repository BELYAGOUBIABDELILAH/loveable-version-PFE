import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Review, ReviewStats } from '@/types/reviews';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewSystemProps {
  providerId: string;
  providerName: string;
  canReview?: boolean;
  isProvider?: boolean;
}

const STORAGE_KEY = 'cityhealth_reviews';

export const ReviewSystem = ({ providerId, providerName, canReview = false, isProvider = false }: ReviewSystemProps) => {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allReviews = JSON.parse(stored);
      return allReviews.filter((r: Review) => r.providerId === providerId && r.status === 'approved');
    }
    return [];
  });

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [patientName, setPatientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

  const stats: ReviewStats = {
    averageRating: reviews.length > 0 
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
      : 0,
    totalReviews: reviews.length,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }
  };

  const submitReview = async () => {
    if (rating === 0 || !comment.trim() || !patientName.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    const newReview: Review = {
      id: crypto.randomUUID(),
      providerId,
      patientName: patientName.trim(),
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'pending',
      helpfulVotes: 0,
      votedBy: [],
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allReviews = stored ? JSON.parse(stored) : [];
      allReviews.push(newReview);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allReviews));

      toast.success('Avis soumis avec succès! Il sera publié après modération.');
      setRating(0);
      setComment('');
      setPatientName('');
      setShowForm(false);
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const voteHelpful = (reviewId: string) => {
    const userId = 'current-user'; // TODO: Replace with actual user ID
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allReviews: Review[] = JSON.parse(stored);
    const updated = allReviews.map(r => {
      if (r.id === reviewId) {
        if (r.votedBy.includes(userId)) {
          return {
            ...r,
            helpfulVotes: r.helpfulVotes - 1,
            votedBy: r.votedBy.filter(id => id !== userId)
          };
        } else {
          return {
            ...r,
            helpfulVotes: r.helpfulVotes + 1,
            votedBy: [...r.votedBy, userId]
          };
        }
      }
      return r;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setReviews(updated.filter(r => r.providerId === providerId && r.status === 'approved'));
    toast.success('Vote enregistré');
  };

  const submitResponse = (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response?.trim()) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allReviews: Review[] = JSON.parse(stored);
    const updated = allReviews.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          providerResponse: {
            text: response.trim(),
            respondedAt: new Date().toISOString(),
          }
        };
      }
      return r;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setReviews(updated.filter(r => r.providerId === providerId && r.status === 'approved'));
    setResponseText(prev => ({ ...prev, [reviewId]: '' }));
    toast.success('Réponse publiée');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Avis et Évaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">{stats.totalReviews} avis</div>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-3">{star}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{
                        width: `${stats.totalReviews > 0 
                          ? (stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100 
                          : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {canReview && !showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full">
              Laisser un avis
            </Button>
          )}

          {showForm && (
            <div className="p-4 border rounded-lg space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Votre évaluation</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Votre nom</label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Votre avis</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReview} disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : 'Publier l\'avis'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun avis pour le moment
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.patientName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {formatDistanceToNow(new Date(review.createdAt), { 
                            addSuffix: true,
                            locale: fr 
                          })}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm">{review.comment}</p>

                  {review.providerResponse && (
                    <div className="ml-4 pl-4 border-l-2 border-primary/20 bg-muted/30 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Réponse du professionnel</span>
                      </div>
                      <p className="text-sm">{review.providerResponse.text}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => voteHelpful(review.id)}
                      className={review.votedBy.includes('current-user') ? 'text-primary' : ''}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Utile ({review.helpfulVotes})
                    </Button>

                    {isProvider && !review.providerResponse && (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={responseText[review.id] || ''}
                          onChange={(e) => setResponseText(prev => ({ 
                            ...prev, 
                            [review.id]: e.target.value 
                          }))}
                          placeholder="Répondre à cet avis..."
                          size={1}
                        />
                        <Button size="sm" onClick={() => submitResponse(review.id)}>
                          Répondre
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
