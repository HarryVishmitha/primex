<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ActivityLogController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Activity::class);

        $user = $request->user();

        if ($user) {
            activity('activity_log')
                ->causedBy($user)
                ->performedOn($user)
                ->event('viewed')
                ->withProperties([
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->log('Viewed activity logs');
        }

        $query = Activity::query()
            ->with(['causer', 'subject'])
            ->latest();

        // Filter by log name (module)
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by event type
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Filter by causer (user)
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search by description
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $activities = $query->paginate($request->get('per_page', 15))
            ->through(function ($activity) {
                return [
                    'id' => $activity->id,
                    'log_name' => $activity->log_name,
                    'description' => $activity->description,
                    'event' => $activity->event,
                    'causer' => $activity->causer ? [
                        'id' => $activity->causer->id,
                        'name' => $activity->causer->name,
                        'email' => $activity->causer->email,
                    ] : null,
                    'subject_type' => $activity->subject_type ? class_basename($activity->subject_type) : null,
                    'subject_id' => $activity->subject_id,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $activity->created_at->diffForHumans(),
                ];
            });

        // Get filter options
        $logNames = Activity::select('log_name')
            ->distinct()
            ->whereNotNull('log_name')
            ->pluck('log_name');

        $events = Activity::select('event')
            ->distinct()
            ->whereNotNull('event')
            ->pluck('event');

        return Inertia::render('ActivityLogs/Index', [
            'activities' => $activities,
            'filters' => $request->only(['log_name', 'event', 'causer_id', 'from_date', 'to_date', 'search']),
            'logNames' => $logNames,
            'events' => $events,
        ]);
    }

    public function show(Activity $activity): Response
    {
        $this->authorize('viewAny', $activity);

        $activity->load(['causer', 'subject']);

        return Inertia::render('ActivityLogs/Show', [
            'activity' => [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'subject' => $activity->subject,
                'properties' => $activity->properties,
                'batch_uuid' => $activity->batch_uuid,
                'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $activity->created_at->diffForHumans(),
            ],
        ]);
    }
}
