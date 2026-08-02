<?php

namespace Tests\Feature;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Routing\Route;
use Illuminate\Support\Str;
use ReflectionMethod;
use ReflectionNamedType;
use Tests\TestCase;

class RouteBindingTest extends TestCase
{
    /**
     * Regression guard: every controller method parameter type-hinted with an
     * Eloquent model must match a route parameter name (exact or snake_case).
     *
     * Laravel's implicit model binding silently skips parameters whose names do
     * not correspond to a route segment — the controller then receives a fresh,
     * empty model and edit/update/delete silently misbehave. This previously
     * happened to the taxes resource: the route registered as `taxes/{tax}` but
     * the controller bound `TaxRate $taxRate`, so `parameters(['tax' => 'taxRate'])`
     * was ignored (the map is keyed by the resource name) and every model-bound
     * action got an empty TaxRate.
     */
    public function test_every_model_typed_controller_parameter_binds_to_a_route_parameter(): void
    {
        $routes = app('router')->getRoutes()->getRoutes();

        $issues = [];
        foreach ($routes as $route) {
            $issues = array_merge($issues, $this->bindingIssuesFor($route));
        }

        $this->assertSame([], $issues, implode("\n", $issues));
    }

    /**
     * @return list<string>
     */
    private function bindingIssuesFor(Route $route): array
    {
        $action = $route->getAction();

        if (! isset($action['uses']) || ! is_string($action['uses']) || ! str_contains($action['uses'], '@')) {
            return [];
        }

        [$class, $method] = explode('@', $action['uses'], 2);

        if (! class_exists($class) || ! method_exists($class, $method)) {
            return [];
        }

        $params = $route->parameterNames();
        $issues = [];

        foreach ((new ReflectionMethod($class, $method))->getParameters() as $parameter) {
            $type = $parameter->getType();

            if (! $type instanceof ReflectionNamedType) {
                continue;
            }

            $typeName = $type->getName();

            if (! is_subclass_of($typeName, Model::class)) {
                continue;
            }

            $name = $parameter->getName();

            if (! in_array($name, $params, true) && ! in_array(Str::snake($name), $params, true)) {
                $issues[] = sprintf(
                    '%s (%s@%s) binds $%s but route params are [%s]',
                    $route->getName() ?? $route->uri(),
                    $class,
                    $method,
                    $name,
                    implode(', ', $params),
                );
            }
        }

        return $issues;
    }
}
