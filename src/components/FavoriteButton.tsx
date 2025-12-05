import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { favoritesService } from '@/services/favoritesService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FavoriteButtonProps {
  providerId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const FavoriteButton = ({ 
  providerId, 
  className, 
  size = 'md',
  variant = 'ghost'
}: FavoriteButtonProps) => {
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const queryClient = useQueryClient();

  // Check favorite status using TanStack Query
  const { 
    data: isFavorite = false, 
    isLoading: isCheckingStatus 
  } = useQuery({
    queryKey: ['favorite-status', providerId],
    queryFn: () => favoritesService.isFavorite(providerId),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Mutation for toggling favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: () => favoritesService.toggleFavorite(providerId),
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorite-status', providerId] });

      // Snapshot the previous value
      const previousStatus = queryClient.getQueryData<boolean>(['favorite-status', providerId]);

      // Optimistically update to the new value
      queryClient.setQueryData<boolean>(['favorite-status', providerId], !previousStatus);

      // Return a context object with the snapshotted value
      return { previousStatus };
    },
    onError: (err, _, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(['favorite-status', providerId], context?.previousStatus);
      
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      
      // Handle specific error cases
      if (errorMessage.includes('already in your favorites')) {
        toast.error('Ce prestataire est déjà dans vos favoris');
      } else {
        toast.error(errorMessage);
      }
    },
    onSuccess: (newStatus) => {
      // Show success message
      if (newStatus) {
        toast.success('Ajouté aux favoris');
      } else {
        toast.success('Retiré des favoris');
      }
      
      // Invalidate favorites list to keep it in sync
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['favorite-status', providerId] });
    },
  });

  const handleFavoriteClick = () => {
    // Show auth modal if user is not authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    toggleFavoriteMutation.mutate();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size="icon"
        className={cn(
          getSizeClasses(),
          'transition-colors duration-200',
          className
        )}
        onClick={handleFavoriteClick}
        disabled={toggleFavoriteMutation.isPending || isCheckingStatus}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        {toggleFavoriteMutation.isPending || isCheckingStatus ? (
          <Loader2 
            size={getIconSize()} 
            className="animate-spin text-muted-foreground" 
          />
        ) : (
          <Heart
            size={getIconSize()}
            className={cn(
              'transition-all duration-200',
              isFavorite
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground hover:text-red-500'
            )}
          />
        )}
      </Button>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="login"
      />
    </>
  );
};